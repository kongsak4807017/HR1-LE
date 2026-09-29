import numpy as np

from reference.life_table import AGE_GROUPS, calculate_from_counts
from reference.lee_carter import fit_lee_carter, forecast_mx
from reference.priority import problem_size_score, individual_total, aggregate

def test_life_table_monotonic_lx():
    pop = {a: 10000.0 for a in AGE_GROUPS}
    deaths = {a: 10.0 for a in AGE_GROUPS}
    deaths["85+"] = 100.0
    rows = calculate_from_counts(pop, deaths)
    assert rows[0]["lx"] == 100000.0
    assert all(rows[i]["lx"] >= rows[i+1]["lx"] for i in range(len(rows)-1))
    assert rows[-1]["qx"] == 1.0
    assert rows[0]["ex"] > 0

def test_problem_size_thresholds():
    assert problem_size_score(0) == 1
    assert problem_size_score(9.99) == 1
    assert problem_size_score(10) == 2
    assert problem_size_score(100) == 3
    assert problem_size_score(1000) == 4
    assert problem_size_score(2000) == 5

def test_priority_total_and_rank():
    a = dict(problem_size=5,severity=5,epidemic=5,social_economic=5,feasibility=5,health_gain=5,public_perception=5)
    b = dict(problem_size=1,severity=1,epidemic=1,social_economic=1,feasibility=1,health_gain=1,public_perception=1)
    assert individual_total(a) == 35
    result = aggregate([
        {"disease_code":"A","rater_id":"1",**a},
        {"disease_code":"B","rater_id":"1",**b},
    ])
    assert result[0]["disease_code"] == "A"
    assert result[0]["computed_rank"] == 1

def test_lee_carter_shapes():
    n_age = len(AGE_GROUPS)
    years = list(range(2010, 2020))
    exposure = np.full((n_age, len(years)), 100000.0)
    base = np.linspace(0.0005, 0.08, n_age)[:,None]
    trend = np.exp(-0.01 * np.arange(len(years)))[None,:]
    deaths = np.maximum(np.round(exposure * base * trend), 1.0)
    fit = fit_lee_carter(deaths, exposure, AGE_GROUPS, years)
    future = forecast_mx(fit, 3)
    assert future.shape == (n_age, 3)
    assert np.all(future > 0)
