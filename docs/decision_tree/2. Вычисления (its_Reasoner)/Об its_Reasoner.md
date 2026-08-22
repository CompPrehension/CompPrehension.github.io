[its_Reasoner](https://github.com/CompPrehension/its_Reasoner) - модуль системы, служащий для реализации вычислений по [графам мыслительных процессов](../1.%20Модели%20(its_DomainModel)/Дерево%20решений/Дерево%20(граф)%20решений), построенных с помощью [its_DomainModel](../1.%20Модели%20(its_DomainModel)/Об%20its_DomainModel)
## Функционал в этом модуле
- Реализация вычислений [LOQI-выражений](../1.%20Модели%20(its_DomainModel)/Дерево%20решений/Выражения).
- Реализация выполнения логики [графов мыслительных процессов](../1.%20Модели%20(its_DomainModel)/Дерево%20решений/Дерево%20(граф)%20решений).
	- В т.ч. предоставление информации о пройденном пути в графе - см. [[./Трассы рассуждения.md|Трассы рассуждения]].

Подробнее о функционале этого модуля читайте в других статьях данного раздела.

Помимо библиотечного API, модуль предоставляет утилиту командной строки `reasoner-cli` для запуска рассуждения и вычисления выражений без написания кода - см. [[../4. Инструменты/CLI.md|Интерфейс командной строки]].
## Примеры использования
Примеры использования описаны на Java, т.к. я думаю, что вы с большей вероятностью будете использовать именно ее (использование на Kotlin в принципе аналогично, и более просто).

Данные примеры также полагаются на код из its_DomainModel, подробнее см. [[../1. Модели (its_DomainModel)/Об its_DomainModel.md#Примеры-использования|их примеры использования]].
#### Создание учебной ситуации
```java
DomainModel situationModel = ...  ;
  
LearningSituation situation = new LearningSituation(  
    situationModel,  
    LearningSituation.collectDecisionTreeVariables(situationModel)   //мапа переменных дерева решений
);
```
#### Вычисление LOQI-выражения
```java
Operator expr = ... ;
LearningSituation situation = ... ;
    
Object result = expr.use(new DomainInterpreterReasoner(  
    situation,  
    new HashMap<>() //пустая мапа контекстных переменных  
));
```
#### Выполнений действий графа мыслительных процессов
```java
DomainSolvingModel model = ... ;
LearningSituation situation = ... ;
  
DecisionTreeTrace decisionTreeTrace = DecisionTreeReasoner.solve(  
    model.getDecisionTree(),  
    situation  
);
```
